const fs = require("fs");
const cloudinary = require("../config/cloudinary");

// upload image to cloudinary
const cloudinaryFileUpload = async (path) => {
  const uniqueFilename = new Date().toISOString();
  const { secure_url, public_id } = await cloudinary.upload(path, {
    public_id: `assets/${uniqueFilename}`,
    tags: "Irembo Asset",
  });
  fs.unlinkSync(path);
  return { secure_url, public_id };
};

module.exports = cloudinaryFileUpload;
