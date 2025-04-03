import React, { createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

// 创建上下文来传递onValueChange
const SelectContext = createContext(null);

const Select = ({ value, onValueChange, children, className, ...props }) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
        className
      )}
      onClick={() => document.getElementById('select-content')?.classList.toggle('hidden')}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder, className, ...props }) => {
  return (
    <span className={cn("block truncate", className)} {...props}>
      {props.children || placeholder}
    </span>
  );
};

const SelectContent = ({ children, className, ...props }) => {
  const { value, onValueChange } = useContext(SelectContext) || {};
  
  return (
    <div
      id="select-content"
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md hidden",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => 
          React.isValidElement(child) ? React.cloneElement(child) : child
        )}
      </div>
    </div>
  );
};

const SelectItem = ({ value, children, className, ...props }) => {
  // 从props中获取onValueChange并移除它，避免它被传递到DOM元素上
  const { onValueChange, ...domProps } = props;
  
  // 获取上下文中的onValueChange函数
  const context = React.useContext(SelectContext);
  
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => {
        // 使用上下文中的onValueChange或props中的onValueChange
        const handleChange = context?.onValueChange || onValueChange;
        if (handleChange) {
          handleChange(value);
          document.getElementById('select-content')?.classList.add('hidden');
        }
      }}
      {...domProps}
    >
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 