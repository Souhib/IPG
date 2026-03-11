import { describe, it, expect, vi } from "vitest"

// Mock i18n before importing the module
vi.mock("@/i18n", () => ({
  default: {
    t: (key: string, opts?: { defaultValue?: string }) => {
      const translations: Record<string, string> = {
        "errors.api.userNotFound": "User not found.",
        "errors.api.invalidCredentials": "Please check your email and password.",
      }
      return translations[key] || opts?.defaultValue || ""
    },
  },
}))

// Must import after mock setup
const { getApiErrorMessage } = await import("./client")

describe("getApiErrorMessage", () => {
  it("returns fallback when error is null", () => {
    expect(getApiErrorMessage(null)).toBe("An error occurred")
    expect(getApiErrorMessage(null, "Custom fallback")).toBe("Custom fallback")
  })

  it("returns fallback when error is undefined", () => {
    expect(getApiErrorMessage(undefined)).toBe("An error occurred")
  })

  it("translates error_key via i18n", () => {
    const error = {
      response: {
        data: {
          error_key: "errors.api.userNotFound",
        },
      },
    }
    expect(getApiErrorMessage(error)).toBe("User not found.")
  })

  it("falls back to frontend_message when error_key has no translation", () => {
    const error = {
      response: {
        data: {
          error_key: "errors.api.unknownKey",
          frontend_message: "Something went wrong on our end.",
        },
      },
    }
    expect(getApiErrorMessage(error)).toBe("Something went wrong on our end.")
  })

  it("falls back to message field", () => {
    const error = {
      response: {
        data: {
          message: "Internal server error",
        },
      },
    }
    expect(getApiErrorMessage(error)).toBe("Internal server error")
  })

  it("falls back to string detail field", () => {
    const error = {
      response: {
        data: {
          detail: "Not authorized",
        },
      },
    }
    expect(getApiErrorMessage(error)).toBe("Not authorized")
  })

  it("extracts first validation error from array detail", () => {
    const error = {
      response: {
        data: {
          detail: [
            { type: "value_error", loc: ["body", "email"], msg: "Invalid email format" },
          ],
        },
      },
    }
    expect(getApiErrorMessage(error)).toBe("Invalid email format")
  })

  it("handles standard Error objects", () => {
    const error = new Error("Network failure")
    expect(getApiErrorMessage(error)).toBe("Network failure")
  })

  it("returns fallback for non-Error objects without response data", () => {
    expect(getApiErrorMessage({ random: "object" })).toBe("An error occurred")
  })
})
