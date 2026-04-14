const ResumeModel = require('../models/Resume');
const UserModel = require('../models/User');
const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const PDFDocument = require('pdfkit');

// Get or create resume for student
const getResume = async (req, res) => {
  const userId = req.user.userId;

  let resume = await ResumeModel.findOne({ studentId: userId });

  if (!resume) {
    // Create empty resume if not exists
    resume = await ResumeModel.create({
      studentId: userId,
      header: {},
      education: [],
      experience: [],
      leadership: [],
      skills: {},
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume retrieved successfully',
    resume,
  });
};

// Update resume
const updateResume = async (req, res) => {
  const userId = req.user.userId;
  const resumeData = req.body;

  let resume = await ResumeModel.findOne({ studentId: userId });

  if (!resume) {
    resume = await ResumeModel.create({
      studentId: userId,
      ...resumeData,
    });
  } else {
    Object.assign(resume, resumeData);
    await resume.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume updated successfully',
    resume,
  });
};

// Generate PDF resume
const generatePDF = async (req, res) => {
  const userId = req.user.userId;

  const resume = await ResumeModel.findOne({ studentId: userId });

  if (!resume) {
    throw new CustomAPIError.NotFoundError('Resume not found');
  }

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: {
      top: 36,
      bottom: 36,
      left: 36,
      right: 36,
    },
  });

  // Set response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="resume-${resume.header.firstName || 'Resume'}.pdf"`
  );

  doc.pipe(res);

  const pageHeight = doc.page.height - 72; // 72 points = 1 inch (top and bottom margins)
  let currentY = 36;

  const addText = (text, x = 36, fontSize = 10, bold = false, align = 'left') => {
    if (currentY > pageHeight) {
      doc.addPage().moveTo(36, 36);
      currentY = 36;
    }
    doc.fontSize(fontSize);
    if (bold) doc.font('Helvetica-Bold');
    doc.text(text, x, currentY, { width: doc.page.width - 72, align });
    if (bold) doc.font('Helvetica');
    currentY = doc.y + 2;
    return currentY;
  };

  const addLine = () => {
    if (currentY > pageHeight - 10) {
      doc.addPage().moveTo(36, 36);
      currentY = 36;
    }
    doc.moveTo(36, currentY).lineTo(doc.page.width - 36, currentY).stroke();
    currentY += 6;
  };



  // Header
  const fullName = `${resume.header.firstName || ''} ${resume.header.lastName || ''}`.trim();
  addText(fullName, 36, 14, true);
  currentY -= 2;

  const address = [
    resume.header.address,
    resume.header.city,
    resume.header.state,
    resume.header.zipCode,
  ]
    .filter(Boolean)
    .join(', ');
  const contactInfo = `${address} • ${resume.header.email} • ${resume.header.phone}`;
  addText(contactInfo, 36, 9);
  
  // Profile links - make them clickable
  const profileLinksList = [
    resume.header.linkedIn && { name: 'LinkedIn', url: resume.header.linkedIn },
    resume.header.github && { name: 'GitHub', url: resume.header.github },
    resume.header.leetcode && { name: 'LeetCode', url: resume.header.leetcode },
  ].filter(Boolean);
  
  if (profileLinksList.length > 0) {
    doc.fontSize(9).fillColor('0066cc');
    const linkText = profileLinksList.map((link) => link.name).join(' • ');
    const linkTextWidth = doc.widthOfString(linkText);
    
    // Add the text with underline styling
    doc.text(linkText, 36, currentY, {
      underline: true,
      link: undefined, // pdfkit will add links per-text in next step
    });
    
    // Create individual clickable regions for each link
    let xOffset = 36;
    profileLinksList.forEach((link, idx) => {
      const linkNameWidth = doc.widthOfString(link.name);
      // Add annotation for clickable link
      doc.annotate(xOffset, currentY - 10, linkNameWidth, 12, {
        Subtype: 'Link',
        A: {
          S: 'URI',
          URI: link.url,
        },
      });
      xOffset += linkNameWidth + doc.widthOfString(' • ');
    });
    
    doc.fillColor('black');
    currentY = doc.y + 2;
  }
  
  currentY += 4;

  // Education Section
  if (resume.education && resume.education.length > 0) {
    addText('Education', 36, 11, true);
    currentY -= 2;

    resume.education.forEach((edu, idx) => {
      if (currentY > pageHeight - 40) {
        doc.addPage().moveTo(36, 36);
        currentY = 36;
      }

      const eduHeader = `${edu.institution}`;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(eduHeader, 36, currentY, { width: doc.page.width - 200 });
      currentY = doc.y;

      const degreeInfo = `${edu.degree}${edu.concentration ? ', ' + edu.concentration : ''}`;
      doc.fontSize(9).font('Helvetica');
      doc.text(degreeInfo, 36, currentY);
      currentY = doc.y;

      if (edu.gpa || edu.graduationMonth || edu.graduationYear) {
        const eduDetails = [
          edu.gpa ? `GPA: ${edu.gpa}` : '',
          edu.graduationMonth && edu.graduationYear
            ? `Graduation: ${edu.graduationMonth} ${edu.graduationYear}`
            : '',
        ]
          .filter(Boolean)
          .join('  ');
        doc.fontSize(9);
        doc.text(eduDetails, 36, currentY);
        currentY = doc.y;
      }

      if (edu.relevantCoursework) {
        doc.fontSize(9);
        doc.text(`Relevant Coursework: ${edu.relevantCoursework}`, 36, currentY);
        currentY = doc.y;
      }

      currentY += 3;
    });
  }

  // Experience Section
  if (resume.experience && resume.experience.length > 0) {
    currentY += 2;
    addText('Experience', 36, 11, true);
    currentY -= 2;

    resume.experience.slice(0, 3).forEach((exp) => {
      if (currentY > pageHeight - 50) {
        doc.addPage().moveTo(36, 36);
        currentY = 36;
      }

      const expHeader = `${exp.organization}`;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(expHeader, 36, currentY, { width: doc.page.width - 200 });
      currentY = doc.y;

      const roleInfo = exp.positionTitle || '';
      const dateRange = `${exp.startMonth || ''} ${exp.startYear || ''} – ${
        exp.isCurrent ? 'Present' : exp.endMonth + ' ' + (exp.endYear || '')
      }`.trim();
      const roleDetails = `${roleInfo}${dateRange ? ' | ' + dateRange : ''}`;
      doc.fontSize(9).font('Helvetica');
      doc.text(roleDetails, 36, currentY);
      currentY = doc.y;

      if (exp.city || exp.location) {
        const location = `${exp.city || ''}${exp.location ? ', ' + exp.location : ''}`.trim();
        doc.fontSize(9);
        doc.text(location, 36, currentY);
        currentY = doc.y;
      }

      if (exp.bulletPoints && exp.bulletPoints.length > 0) {
        exp.bulletPoints.slice(0, 4).forEach((bullet) => {
          if (currentY > pageHeight - 15) {
            doc.addPage().moveTo(36, 36);
            currentY = 36;
          }
          doc.fontSize(9);
          doc.text(`• ${bullet.text}`, 50, currentY, { width: doc.page.width - 150 });
          currentY = doc.y + 2;
        });
      }

      currentY += 2;
    });
  }

  // Leadership & Activities Section
  if (resume.leadership && resume.leadership.length > 0) {
    currentY += 2;
    addText('Leadership & Activities', 36, 11, true);
    currentY -= 2;

    resume.leadership.slice(0, 2).forEach((lead) => {
      if (currentY > pageHeight - 50) {
        doc.addPage().moveTo(36, 36);
        currentY = 36;
      }

      const leadHeader = `${lead.organization}`;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(leadHeader, 36, currentY, { width: doc.page.width - 200 });
      currentY = doc.y;

      const roleInfo = lead.role || '';
      const dateRange = `${lead.startMonth || ''} ${lead.startYear || ''} – ${
        lead.isCurrent ? 'Present' : lead.endMonth + ' ' + (lead.endYear || '')
      }`.trim();
      const roleDetails = `${roleInfo}${dateRange ? ' | ' + dateRange : ''}`;
      doc.fontSize(9).font('Helvetica');
      doc.text(roleDetails, 36, currentY);
      currentY = doc.y;

      if (lead.bulletPoints && lead.bulletPoints.length > 0) {
        lead.bulletPoints.slice(0, 3).forEach((bullet) => {
          if (currentY > pageHeight - 15) {
            doc.addPage().moveTo(36, 36);
            currentY = 36;
          }
          doc.fontSize(9);
          doc.text(`• ${bullet.text}`, 50, currentY, { width: doc.page.width - 150 });
          currentY = doc.y + 2;
        });
      }

      currentY += 2;
    });
  }

  // Skills & Interests Section
  if (
    resume.skills?.technical ||
    resume.skills?.languages ||
    resume.skills?.laboratory ||
    resume.interests
  ) {
    currentY += 2;
    addText('Skills & Interests', 36, 11, true);
    currentY -= 2;

    if (resume.skills?.technical) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Technical: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.skills.technical, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }

    if (resume.skills?.languages) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Languages: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.skills.languages, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }

    if (resume.skills?.laboratory) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Laboratory: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.skills.laboratory, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }

    if (resume.interests) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Interests: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.interests, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }
  }

  doc.end();
};

module.exports = {
  getResume,
  updateResume,
  generatePDF,
};
