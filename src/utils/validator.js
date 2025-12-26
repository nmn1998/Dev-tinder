const validator = require("validator");
const validateSignupData = (data) => {
  const { firstName, lastName, emailId, password, photoUrl } = data;
  if (!firstName || !lastName) {
    throw new Error("All fields are required");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateProfileEditFields = (data) => {
  const ALLOWED_FIELDS = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
    "photoUrl",
  ];
  const isUpdateAllowed = Object.keys(data).every((field) =>
    ALLOWED_FIELDS.includes(field)
  );
  return isUpdateAllowed;
};

module.exports = {
  validateSignupData,
  validateProfileEditFields
};
