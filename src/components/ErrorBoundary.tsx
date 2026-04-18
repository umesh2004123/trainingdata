import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-4 bg-card border border-border rounded-xl p-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <Button onClick={this.handleReset} className="w-full">Return to Dashboard</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
