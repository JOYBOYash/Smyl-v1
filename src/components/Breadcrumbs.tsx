import React from "react";
import { Link } from "react-router-dom";
import { IoChevronForward, IoHome } from "react-icons/io5";

interface BreadcrumbsProps {
  toolName: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ toolName }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-2"
    >
      <ol
        className="flex items-center space-x-2 text-xs font-semibold text-[#626A73]"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
          className="flex items-center"
        >
          <Link
            to="/"
            itemProp="item"
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors duration-150"
          >
            <IoHome className="w-3.5 h-3.5" />
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        <li className="flex items-center text-[#8D959F] select-none">
          <IoChevronForward className="w-3 h-3" />
        </li>

        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
          className="flex items-center text-[#17191C]"
        >
          <span itemProp="name" className="truncate">
            {toolName}
          </span>
          <meta itemProp="position" content="2" />
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
