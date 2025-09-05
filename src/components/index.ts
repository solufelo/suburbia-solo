/**
 * Component barrel exports for cleaner imports
 * Usage: import { Heading, ButtonLink, Bounded } from "@/components";
 */

// Layout components
export * from "./Bounded";        // Container with consistent padding/margins
export * from "./NavBar";         // Site navigation header

// UI components  
export * from "./ButtonLink";     // Styled button with Prismic link integration
export * from "./Heading";        // Typography component with Bowlby font
export * from "./Line";           // Decorative line element

// Brand components
export * from "./Logo";           // Site logo component

// Utility components
export * from "./SVGFilters";     // SVG filter definitions for effects

// Layout system components
export * from "./SliceBundle";    // Bundle system for organizing slices
export * from "./CascadeContainer"; // Container for cascading effects
export * from "./StickySliceZone"; // Sticky slice zone with cascade effects


