import * as React from "react"
import { cn } from "@/lib/utils"

// Contexto para manejar el estado del Command
const CommandContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  filter?: (value: string, search: string) => number
}>({
  value: "",
  onValueChange: () => {},
})

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  filter?: (value: string, search: string) => number
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, value = "", onValueChange = () => {}, filter, ...props }, ref) => {
    return (
      <CommandContext.Provider value={{ value, onValueChange, filter }}>
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
            className
          )}
          {...props}
        />
      </CommandContext.Provider>
    )
  }
)
Command.displayName = "Command"

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, value, onValueChange, onChange, ...props }, ref) => {
    const context = React.useContext(CommandContext)
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onValueChange?.(newValue)
      context.onValueChange(newValue)
      onChange?.(e)
    }

    return (
      <div className="flex items-center border-b px-3">
        <input
          ref={ref}
          value={value ?? context.value}
          onChange={handleChange}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { value } = React.useContext(CommandContext)
  
  if (!value) return null
  
  return (
    <div
      ref={ref}
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
})
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    heading?: React.ReactNode
  }
>(({ className, heading, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden p-1 text-foreground", className)}
    {...props}
  >
    {heading && (
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {heading}
      </div>
    )}
    {children}
  </div>
))
CommandGroup.displayName = "CommandGroup"

interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value?: string
  onSelect?: (value: string) => void
  disabled?: boolean
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, value, onSelect, disabled, children, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && value) {
        onSelect?.(value)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          disabled 
            ? "pointer-events-none opacity-50" 
            : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandItem.displayName = "CommandItem"

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
}
