const ResumePreview = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500 text-center py-8">No resume data yet. Start filling in your details.</div>;
  }

  const formatDate = (startMonth, startYear, endMonth, endYear, isCurrent) => {
    const start = startMonth && startYear ? `${startMonth} ${startYear}` : '';
    const end = isCurrent ? 'Present' : endMonth && endYear ? `${endMonth} ${endYear}` : '';
    return start && end ? `${start} – ${end}` : start || end || '';
  };

  return (
    <div className="bg-white p-6 font-sans text-sm leading-relaxed" style={{ fontSize: '10pt' }}>
      {/* Header */}
      <div className="text-center mb-1">
        <h1 className="text-lg font-bold">
          {data.header?.firstName} {data.header?.lastName}
        </h1>
      </div>

      {/* Contact Info */}
      <div className="text-center text-xs mb-1 pb-1">
        {[
          data.header?.address,
          data.header?.city,
          data.header?.state,
          data.header?.zipCode,
        ]
          .filter(Boolean)
          .join(', ')}{' '}
        • {data.header?.email} • {data.header?.phone}
      </div>
      {/* Profile Links */}
      <div className="text-center text-xs mb-3 border-b pb-1">
        {[
          data.header?.linkedIn && {
            name: 'LinkedIn',
            url: data.header.linkedIn,
          },
          data.header?.github && {
            name: 'GitHub',
            url: data.header.github,
          },
          data.header?.leetcode && {
            name: 'LeetCode',
            url: data.header.leetcode,
          },
        ]
          .filter(Boolean)
          .map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {link.name}
            </a>
          ))
          .reduce((prev, curr) => [
            prev,
            ' • ',
            curr,
          ])}
      </div>

      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <div className="mb-2">
          <h2 className="font-bold text-xs border-b">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-bold">{edu.institution}</div>
              <div>
                {edu.degree}
                {edu.concentration && `, ${edu.concentration}`}
              </div>
              <div className="text-xs">
                {edu.gpa && `GPA: ${edu.gpa}`}
                {edu.graduationMonth &&
                  edu.graduationYear &&
                  ` | Graduation: ${edu.graduationMonth} ${edu.graduationYear}`}
              </div>
              {edu.relevantCoursework && (
                <div className="text-xs">
                  Relevant Coursework: {edu.relevantCoursework}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-2">
          <h2 className="font-bold text-xs border-b">Experience</h2>
          {data.experience.slice(0, 3).map((exp, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-bold">{exp.organization}</div>
              <div>
                {exp.positionTitle}{' '}
                {formatDate(
                  exp.startMonth,
                  exp.startYear,
                  exp.endMonth,
                  exp.endYear,
                  exp.isCurrent
                ) && ` | ${formatDate(
                  exp.startMonth,
                  exp.startYear,
                  exp.endMonth,
                  exp.endYear,
                  exp.isCurrent
                )}`}
              </div>
              {exp.city || exp.location ? (
                <div className="text-xs">
                  {exp.city}
                  {exp.location && `, ${exp.location}`}
                </div>
              ) : null}
              {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                <ul className="ml-4 text-xs">
                  {exp.bulletPoints.slice(0, 4).map(
                    (bullet, bIdx) =>
                      bullet.text && (
                        <li key={bIdx} className="list-disc">
                          {bullet.text}
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Leadership & Activities Section */}
      {data.leadership && data.leadership.length > 0 && (
        <div className="mb-2">
          <h2 className="font-bold text-xs border-b">Leadership & Activities</h2>
          {data.leadership.slice(0, 2).map((lead, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-bold">{lead.organization}</div>
              <div>
                {lead.role}{' '}
                {formatDate(
                  lead.startMonth,
                  lead.startYear,
                  lead.endMonth,
                  lead.endYear,
                  lead.isCurrent
                ) && ` | ${formatDate(
                  lead.startMonth,
                  lead.startYear,
                  lead.endMonth,
                  lead.endYear,
                  lead.isCurrent
                )}`}
              </div>
              {lead.bulletPoints && lead.bulletPoints.length > 0 && (
                <ul className="ml-4 text-xs">
                  {lead.bulletPoints.slice(0, 3).map(
                    (bullet, bIdx) =>
                      bullet.text && (
                        <li key={bIdx} className="list-disc">
                          {bullet.text}
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills & Interests Section */}
      {((data.skills?.technical ||
        data.skills?.languages ||
        data.skills?.laboratory) ||
        data.interests) && (
        <div className="mb-2">
          <h2 className="font-bold text-xs border-b">Skills & Interests</h2>
          {data.skills?.technical && (
            <div className="text-xs">
              <span className="font-bold">Technical:</span> {data.skills.technical}
            </div>
          )}
          {data.skills?.languages && (
            <div className="text-xs">
              <span className="font-bold">Languages:</span> {data.skills.languages}
            </div>
          )}
          {data.skills?.laboratory && (
            <div className="text-xs">
              <span className="font-bold">Laboratory:</span>{' '}
              {data.skills.laboratory}
            </div>
          )}
          {data.interests && (
            <div className="text-xs">
              <span className="font-bold">Interests:</span> {data.interests}
            </div>
          )}
        </div>
      )}

      {/* One-page warning - visual indicator only */}
      <div className="mt-4 text-xs text-gray-500 text-center border-t pt-2">
        ✓ One-page standard template
      </div>
    </div>
  );
};

export default ResumePreview;
