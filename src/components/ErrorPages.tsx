import React, { Component, ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IoAlertCircleOutline, IoHomeOutline, IoRefreshOutline, IoWarningOutline } from "react-icons/io5";

// NotFoundPage (404 Error)
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#EDF1F5] min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E1E5E9] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-[#E8EEFF] text-[#0145F2] rounded-full flex items-center justify-center mx-auto">
          <IoAlertCircleOutline className="w-9 h-9" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-[#0145F2] uppercase bg-[#E8EEFF] px-2.5 py-1 rounded">
            Error 404
          </span>
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#17191C] tracking-tight leading-tight pt-1">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-[14px] text-[#626A73] leading-relaxed">
            The path you are looking for does not exist, has been removed, or moved to a canonical location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="h-10 px-5 rounded-lg bg-[#0145F2] text-white font-semibold text-xs hover:bg-[#0039D4] active:bg-[#0030B8] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <IoHomeOutline className="w-4 h-4" />
            <span>Return Home</span>
          </button>
          
          <button
            onClick={() => {
              navigate("/tools");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="h-10 px-5 rounded-lg border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F5F7F9] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center"
          >
            Explore Tools
          </button>
        </div>
      </div>
    </div>
  );
};

// Server500Page (500 Error / Critical Fallback)
interface Server500PageProps {
  errorMsg?: string;
  onReset?: () => void;
}

export const Server500Page: React.FC<Server500PageProps> = ({ errorMsg, onReset }) => {
  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#EDF1F5] min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E1E5E9] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <IoWarningOutline className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded">
            System Alert
          </span>
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#17191C] tracking-tight leading-tight pt-1">
            Unexpected Error
          </h1>
          <p className="text-xs sm:text-[14px] text-[#626A73] leading-relaxed">
            Our application encountered a problem rendering this page. No private account credentials or data are affected.
          </p>
          {errorMsg && (
            <div className="p-3 bg-[#EDF1F5] rounded-xl text-left border border-[#E1E5E9] mt-3">
              <p className="text-[11px] font-semibold uppercase text-[#626A73] tracking-wide">Status Description</p>
              <p className="text-[12px] font-mono text-[#17191C] break-words mt-1">{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <button
            onClick={handleReload}
            className="h-10 px-5 rounded-lg bg-[#0145F2] text-white font-semibold text-xs hover:bg-[#0039D4] active:bg-[#0030B8] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <IoRefreshOutline className="w-4 h-4 animate-spin-slow" />
            <span>Try Reloading</span>
          </button>
          
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="h-10 px-5 rounded-lg border border-[#E1E5E9] bg-white text-[#17191C] hover:bg-[#F5F7F9] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// React ErrorBoundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log internally, NEVER dump full stack traces directly to users
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Securely display error message without exposing stack trace or internals
      const safeMessage = this.state.error?.message || "An unhandled layout error occurred.";
      return <Server500Page errorMsg={safeMessage} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
