const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const CustomAPIError = require('../errors');

const fileUpload = async (file, folder, acceptType) => {
  const fileMimeType = file.mimetype;
  const fileSize = file.size; // bytes
  let maxFileSize, acceptMIME, maxFileMB;

  if (acceptType == 'image') {
    acceptMIME = 'image/';
    maxFileSize = 1 * 1024 * 1024; // 1 MB
    maxFileMB = 1;
  } else if (acceptType == 'document') {
    acceptMIME = 'application/pdf';
    maxFileSize = 2 * 1024 * 1024; // 2 MB
    maxFileMB = 2;
  }

  if (!fileMimeType.startsWith(acceptMIME)) {
    throw new CustomAPIError.BadRequestError('Invalid file format!');
  }

  if (fileSize > maxFileSize) {
    throw new CustomAPIError.BadRequestError(
      `Maximum file size ${maxFileMB} MB exceeded!`
    );
  }

  // For documents (like resumes), save locally to avoid Cloudinary's 401 PDF block
  if (acceptType === 'document') {
    const publicFolder = path.resolve(__dirname, '../public/resumes');
    if (!fs.existsSync(publicFolder)) {
      fs.mkdirSync(publicFolder, { recursive: true });
    }

    const newFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const destinationPath = path.join(publicFolder, newFileName);
    
    await file.mv(destinationPath);
    console.log(`Document uploaded locally! -> ${newFileName}`);
    
    return {
      success: true,
      message: 'File Uploaded',
      fileURL: `http://localhost:5000/resumes/${newFileName}`,
    };
  }

  // Fallback for images via Cloudinary
  const tmpFolder = path.resolve(__dirname, '../tmp');
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder, { recursive: true });
  }

  const filePath = path.join(tmpFolder, file.name);
  await file.mv(filePath);

  const uploadedFile = await cloudinary.uploader.upload(filePath, {
    use_filename: true,
    folder,
  });

  fs.unlinkSync(filePath);

  if (uploadedFile) {
    console.log(`File upload successful!`);
    return {
      success: true,
      message: 'File Uploaded',
      fileURL: uploadedFile?.secure_url,
    };
  }

  throw new Error('File upload failed!');
};

module.exports = { fileUpload };
