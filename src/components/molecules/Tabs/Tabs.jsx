"use client";
import React, { useState, useEffect } from "react";
import styles from "./Tabs.module.css";
import clsx from "clsx";

/**
 * Tabs Component - A flexible and accessible tabs component
 *
 * Features:
 * - Full accessibility support with ARIA attributes
 * - Responsive design that adapts to mobile screens
 * - Customizable colors and animations
 * - Support for icons and custom content
 * - Keyboard navigation support
 * - Smooth transitions and hover effects
 *
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with {label, value, icon, disabled, badge}
 * @param {string|number} props.activeTab - Currently active tab value (default: first tab)
 * @param {Function} props.onTabChange - Callback when tab changes (tabValue) => void
 * @param {string} props.color - Primary color for active state (default: '#0074d9')
 * @param {boolean} props.fullWidth - Whether tabs should take full width (default: false)
 * @param {boolean} props.centered - Whether to center the tabs (default: false)
 * @param {string} props.className - Additional CSS class for container
 * @param {Object} props.style - Additional inline styles for container
 * @param {boolean} props.disabled - Disable all tabs (default: false)
 * @param {boolean} props.animated - Enable smooth transitions (default: true)
 * @param {string} props.orientation - Tab orientation: 'horizontal' | 'vertical' (default: 'horizontal')
 * @returns {JSX.Element} Tabs component
 *
 * @example
 * // Basic usage
 * <Tabs
 *   tabs={[
 *     { label: 'Tab 1', value: 'tab1' },
 *     { label: 'Tab 2', value: 'tab2' }
 *   ]}
 *   activeTab="tab1"
 *   onTabChange={setActiveTab}
 * />
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  color = "#0074d9",
  fullWidth = false,
  centered = false,
  className = "",
  style = {},
  disabled = false,
  animated = true,
  orientation = "horizontal",
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || tabs[0]?.value
  );

  // Sync internal state with external activeTab prop
  useEffect(() => {
    if (activeTab !== undefined) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (tabValue, tabDisabled) => {
    if (disabled || tabDisabled) return;

    setInternalActiveTab(tabValue);
    onTabChange?.(tabValue);
  };

  const handleKeyDown = (event, tabValue, tabDisabled) => {
    if (disabled || tabDisabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTabClick(tabValue, tabDisabled);
    }
  };

  if (!tabs.length) {
    return null;
  }

  const containerClasses = clsx(
    styles.tabsContainer,
    fullWidth && styles.fullWidth,
    centered && styles.centered,
    orientation === "vertical" && styles.vertical,
    disabled && styles.disabled,
    className
  );

  const tabListClasses = clsx(
    styles.tabList,
    orientation === "vertical" && styles.verticalList
  );

  return (
    <div
      className={containerClasses}
      style={{
        "--tab-color": color,
        ...style,
      }}
      role="tablist"
      aria-orientation={orientation}
    >
      <div className={tabListClasses}>
        {tabs.map((tab, index) => {
          const isActive = tab.value === internalActiveTab;
          const isDisabled = disabled || tab.disabled;

          const tabClasses = clsx(
            styles.tab,
            isActive && styles.active,
            isDisabled && styles.disabled,
            animated && styles.animated
          );

          return (
            <button
              key={tab.value}
              className={tabClasses}
              onClick={() => handleTabClick(tab.value, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, tab.value, tab.disabled)}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              type="button"
            >
              {tab.icon && tab.icon}
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.badge && (
                <span
                  className={styles.tabBadge}
                  aria-label={`${tab.badge} notifications`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
