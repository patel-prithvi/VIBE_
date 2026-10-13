import React from 'react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-600 text-xl">📊</span>
            </div>
            <p className="text-slate-600 text-sm">Chart temporarily unavailable</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-xs text-orange-600 hover:text-orange-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;