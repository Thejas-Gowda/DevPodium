const validator = require("validator");
const isEmpty = require("./is_empty");
module.exports = function validatePostInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";



  if (validator.isEmpty(data.text)) {
    errors.text = "Post field is required";
  }
  if (!validator.isLength(data.text, {
      min: 2,
      max: 300
    })) {
    errors.text = "post must be between 2 to 300 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};