declare module '@radix-ui/react-tabs' {
  import * as React from 'react';

  type PrimitiveButtonProps = React.ComponentProps<'button'>;
  type PrimitiveDivProps = React.ComponentProps<'div'>;

  export interface TabsProps extends PrimitiveDivProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }

  export interface TabsListProps extends PrimitiveDivProps {}

  export interface TabsTriggerProps extends PrimitiveButtonProps {
    value: string;
  }

  export interface TabsContentProps extends PrimitiveDivProps {
    value: string;
  }

  export const Root: React.FC<TabsProps>;
  export const List: React.FC<TabsListProps>;
  export const Trigger: React.FC<TabsTriggerProps>;
  export const Content: React.FC<TabsContentProps>;
} 