import { useState, useEffect } from "react";
import * as yup from "yup";
// Import the axios library:
import axios from "axios";

const validationErrors = {
  passwordPatternWrong:
    "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character",
  termsIncorrect: "Terms must be accepted",
};

const formSchema = yup.object().shape({
  password: yup
    .string()
    .required()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      validationErrors.passwordPatternWrong
    ),
  accept: yup.boolean().oneOf([true], validationErrors.termsIncorrect),
});

export default function App() {
  const [values, setValues] = useState({ password: "", accept: false });
  const [errors, setErrors] = useState({ password: "", accept: "" });
  const [enabled, setEnabled] = useState(false);
  // New state for handling server responses:
  const [success, setSuccess] = useState("");
  const [failure, setFailure] = useState("");

  useEffect(() => {
    formSchema.isValid(values).then((isValid) => {
      setEnabled(isValid);
    });
  }, [values]);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    axios
      .post("https://any.endpoint.com", values)
      .then((res) => {
        setSuccess(res.data);
        setFailure("");
      })
      .catch((err) => {
        setFailure(err.response);
        setSuccess("");
      });
  };

  const handleChange = (evt) => {
    let { type, checked, name, value } = evt.target;
    if (type === "checkbox") value = checked;
    setValues({ ...values, [name]: value });
    // The ".reach()/.validate()" combination allows you to check a single value
    yup
      .reach(formSchema, name)
      .validate(value)
      .then(() => {
        // If value is valid, the corresponding error message will be deleted
        setErrors({ ...errors, [name]: "" });
      })
      .catch((err) => {
        // If invalid, we update the error message with the text returned by Yup
        // This error message was hard-coded in the schema
        setErrors({ ...errors, [name]: err.errors[0] });
      });
  };
  // Message returned by the server is displayed right after the h2 header:
  return (
    <div>
      <h2>Submitting a Form</h2>
      {success && <div>{success}</div>}
      {failure && <div>{failure}</div>}
      <form onSubmit={handleSubmit}>
        {errors.password && <span>{errors.password}</span>}
        <label>
          Password
          <input
            type="text"
            name="password"
            placeholder="Type Password"
            onChange={handleChange}
            value={values.password}
          />
        </label>
        {errors.accept && <span>{errors.accept}</span>}
        <label>
          Accept terms
          <input
            checked={values.accept}
            onChange={handleChange}
            name="accept"
            type="checkbox"
          />
        </label>
        <input disabled={!enabled} type="submit" />
      </form>
    </div>
  );
}