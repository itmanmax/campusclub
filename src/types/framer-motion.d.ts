declare module 'framer-motion' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export interface Motion {
    (props: MotionProps & { children?: React.ReactNode }): JSX.Element;
  }

  export const motion: {
    div: Motion;
    span: Motion;
    button: Motion;
    a: Motion;
    ul: Motion;
    li: Motion;
    [key: string]: Motion;
  };
} 