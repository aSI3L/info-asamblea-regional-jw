import { API_ERRORS } from "@/constants/api"

export class ErrorHandler {
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === "string") {
      return error
    }

    return API_ERRORS.UNKNOWN_ERROR
  }

  static logError(error: unknown, context?: string) {
    console.error(`[${context || "Unknown"}]:`, error)
  }
}
