import React from "react";
import type { IconType } from "react-icons";
import { FaXmark } from "react-icons/fa6";
import classNames from "classnames";
import Button from "../button/Button";
import type { TooltipProp } from "../tooltip/Tooltip";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./Menu.module.css";

export interface MenuProps {
  close: () => void;
  children?: React.ReactNode;
}

const MenuContext = React.createContext<{ close: () => void } | null>(null);

export type MenuItemProps =
  | ({
      icon?: IconType;
      text: string;
      href?: string;
      onClick?: () => void;
      keepOpenOnClick?: boolean;
      /** Shows a bullet in front of the item, for one-of-several options
       * (the current view mode, the current sort order). */
      selected?: boolean;
      /** Dimmed and unclickable, but still shown -- an option that only
       * applies in some states reads better greyed out, with a tooltip
       * saying what would enable it, than appearing and disappearing. */
      disabled?: boolean;
      separator?: false;
    } & TooltipProp)
  | {
      separator: true;
      onClick?: never;
      keepOpenOnClick?: never;
      selected?: never;
      disabled?: never;
    };

export const MenuItem = ({
  keepOpenOnClick = false,
  ...props
}: MenuItemProps) => {
  const { close: closeMenu } = React.useContext(MenuContext)!;

  const { onClick } = props;
  const disabled = !props.separator && props.disabled;
  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled) {
        // Still swallowed, so a disabled item with an `href` can't navigate.
        e.preventDefault();
        return;
      }
      if (onClick) {
        e.preventDefault();
        onClick();
        if (!keepOpenOnClick) {
          closeMenu();
        }
      }
    },
    [disabled, onClick, keepOpenOnClick, closeMenu],
  );

  if (props.separator) {
    return <li className={styles.menuSeparator} />;
  }
  const link = (
    <a
      href={disabled ? undefined : props.href}
      onClick={handleClick}
      className={classNames(
        styles.menuItemLink,
        disabled && styles.menuItemDisabled,
      )}
      aria-disabled={disabled || undefined}
      title={props.text}
    >
      {/* Always rendered (even unselected/no icon), reserving a fixed
       * column so item text always lines up regardless of a sibling
       * item's own selected/icon state. */}
      {/* The dot is drawn, not a "●" glyph: that comes from whichever font
       * has it, often a fallback with its own line height, and the item
       * grew or shrank with it. */}
      <span className={styles.menuItemBullet} aria-hidden>
        {props.selected && <span className={styles.menuItemDot} />}
      </span>
      <span className={styles.menuItemIcon}>
        {props.icon && React.createElement(props.icon)}
      </span>
      <span className={styles.menuItemText}>{props.text}</span>
    </a>
  );

  return (
    <li className={styles.menuItem}>
      {props.tooltip ? (
        // The menu is a touch-first surface, so a menu item's tooltip has
        // to survive there: long press, since a tap picks the item.
        <Tooltip
          popover={props.tooltip}
          placement={props.tooltipPlacement ?? "inline-start"}
          touch={props.tooltipTouch ?? "long-press"}
          className={styles.menuItemTooltip}
        >
          {link}
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
};

export const MenuHeading = ({ children }: React.PropsWithChildren) => (
  <li className={styles.menuHeading}>{children}</li>
);

export const Menu = ({ close, ...props }: MenuProps) => {
  return (
    <MenuContext.Provider value={{ close }}>
      {/* Blocks (and closes on) any touch/click on the content behind the
       * menu -- a plain `onClick` already covers a touch tap too, via the
       * browser's own synthesized click event. */}
      <div className={styles.backdrop} onClick={close} />
      <div className={styles.menu}>
        <header className={styles.menuHeaderBar}>
          <Button
            link
            shape="circle"
            className={styles.closeButton}
            onClick={close}
          >
            <FaXmark />
          </Button>
        </header>
        <ul className={styles.menuList}>{props.children}</ul>
      </div>
    </MenuContext.Provider>
  );
};
