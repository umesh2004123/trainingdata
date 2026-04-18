import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when route (resetKey) changes
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-4 bg-card border border-border rounded-xl p-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground break-words">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">Reload</Button>
              <Button onClick={this.handleReset} className="flex-1">Go Home</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
