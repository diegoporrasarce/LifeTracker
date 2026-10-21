/**
 * Ambient declarations for non TypeScript assets.
 *
 * `global.css` is only used on the web build to provide the font variables,
 * so the import does not need any type information.
 */

declare module '*.css';
