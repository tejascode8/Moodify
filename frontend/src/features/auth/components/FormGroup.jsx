import React, { useState } from "react";

const FormGroup = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = true,
  autoComplete,
  id,
  hint,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  const effectiveType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <div className="form-group">
      <div className="form-group__label-row">
        <label htmlFor={inputId}>{label}</label>
        {hint && <span className="form-group__hint">{hint}</span>}
      </div>
      <div className="input-wrapper">
        <input
          value={value}
          onChange={onChange}
          type={effectiveType}
          id={inputId}
          name={inputId}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        {isPasswordField && (
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormGroup;
