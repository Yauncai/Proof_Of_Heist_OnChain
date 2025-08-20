import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'pending';
  title: string;
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    if (toast.type !== 'pending' && toast.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.type]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500 bg-green-500/10 text-green-400';
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400';
      case 'pending':
        return 'border-blue-500 bg-blue-500/10 text-blue-400';
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        border-2 rounded-lg p-4 backdrop-blur-sm
        ${getToastStyles()}
        shadow-lg
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm mb-1">
              {toast.title}
            </h4>
            <p className="text-sm opacity-90">
              {toast.message}
            </p>
          </div>

          {toast.type !== 'pending' && (
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {toast.type !== 'pending' && toast.duration && (
          <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all ease-linear ${
                toast.type === 'success' ? 'bg-green-400' : 
                toast.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
              }`}
              style={{ 
                width: '100%',
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};


interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="space-y-3 p-6">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastNotification;