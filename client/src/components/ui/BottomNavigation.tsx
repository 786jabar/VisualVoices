import React from 'react';
import { Link } from 'wouter';
import { Home, Image, Mic, Upload, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activePath: string;
}

export default function BottomNavigation({ activePath }: BottomNavigationProps) {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
    { icon: Mic, label: 'Create', path: '/create' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link href={item.path} key={item.path}>
          <a 
            className={`bottom-nav__item ${activePath === item.path ? 'active' : ''}`}
            aria-current={activePath === item.path ? 'page' : undefined}
          >
            <item.icon className="bottom-nav__item-icon" />
            <span className="bottom-nav__item-label">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}