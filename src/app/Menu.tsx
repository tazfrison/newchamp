import { Menu as MenuInner, MenuItem as MenuItemInner, SubMenu as SubMenuInner } from '@szhsin/react-menu';
import "@szhsin/react-menu/dist/core.css";
import menuStyles from './Menu.module.css';

export const menuClassName = ({ state }: any) =>
  state === "opening"
    ? menuStyles.menuOpening
    : state === "closing"
      ? menuStyles.menuClosing
      : menuStyles.menu;

const menuItemClassName = ({ hover }: any) =>
  hover ? menuStyles.menuItemHover : menuStyles.menuItem;

const submenuItemClassName = (modifiers: any) =>
  `${menuStyles.submenuItem} ${menuItemClassName(modifiers)}`;

export const Menu = (props: any) => (
  <MenuInner {...props} menuClassName={menuClassName} />
);

export const MenuItem = (props: any) => (
  <MenuItemInner {...props} className={menuItemClassName} />
);

export const SubMenu = (props: any) => (
  <SubMenuInner
    {...props}
    menuClassName={menuClassName}
    itemProps={{ className: submenuItemClassName }}
    offsetY={-7}
  />
);
