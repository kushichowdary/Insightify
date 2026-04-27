
import React, { useEffect } from 'react';
import { AlertMessage, AlertType } from '../types';
import Icon from './Icon';

interface AlertProps {
  alert: AlertMessage;
  onDismiss: (id: number) => void;
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: string; }> = {
  success: {
    bg: 'bg-green-500/10 dark:bg-green-500/10',
    border: 'border-green-500/50 dark:border-green-500/50',
    text: 'text-green-700 dark:text-green-300',
    icon: 'check-circle'
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/10',
    border: 'border-red-500/50 dark:border-red-500/50',
    text: 'text-red-700 dark:text-red-300',
    icon: 'exclamation-circle'
  },
  info: {
    bg: 'bg-magenta-500/10 dark:bg-magenta-500/10',
    border: 'border-magenta-500/50 dark:border-magenta-500/50',
    text: 'text-magenta-500 dark:text-magenta-300',
    icon: 'info-circle'
  }
};

const Alert: React.FC<AlertProps> = ({ alert, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(alert.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  const styles = alertStyles[alert.type];

  return (
    <div className={`flex items-center p-4 mb-4 text-sm ${styles.text} rounded-lg ${styles.bg} border ${styles.border} shadow-lg animate-fade-in-down backdrop-blur-sm`} role="alert">
      <Icon name={styles.icon} className="mr-3"/>
      <span className="font-medium">{alert.message}</span>
      <button onClick={() => onDismiss(alert.id)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full hover:bg-opacity-20 hover:bg-current">
        <Icon name="times" />
      </button>
    </div>
  );
};

export const AlertContainer: React.FC<{ alerts: AlertMessage[], onDismiss: (id: number) => void }> = ({ alerts, onDismiss }) => {
    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
            {alerts.map(alert => (
                <Alert key={alert.id} alert={alert} onDismiss={onDismiss} />
            ))}
        </div>
    );
};