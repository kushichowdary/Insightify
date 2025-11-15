import React, { Component, ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Icon from './Icon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <Card className="max-w-lg text-center">
            <Icon name="exclamation-triangle" className="text-4xl text-brand-error mb-4" />
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Something went wrong.</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
                We've encountered an unexpected error. Please try refreshing the page. The error has been logged to the console.
            </p>
            {this.state.error && (
                <details className="mt-4 text-left p-2 bg-slate-100 dark:bg-black/20 rounded-lg text-xs">
                    <summary className="cursor-pointer font-semibold">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap overflow-auto">
                        {this.state.error.toString()}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </pre>
                </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
