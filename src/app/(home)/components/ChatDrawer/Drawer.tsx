import React, { useEffect, useRef } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Drawer = ({ open, onClose, children }: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <aside
      ref={drawerRef}
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transform ${
        open ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="w-64 h-full">{children}</div>
    </aside>
  );
};

export default Drawer;