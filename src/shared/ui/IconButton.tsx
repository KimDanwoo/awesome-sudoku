interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const IconButton = ({ icon, onClick, className, disabled }: IconButtonProps) => (
  <button
    className={`px-4 py-4 rounded-full hover:bg-gray-100 transition-colors ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon}
  </button>
);

export default IconButton;
