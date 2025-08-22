import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

const Popover: React.FC<PopoverProps> = ({ 
  open = false, 
  onOpenChange = () => {}, 
  children 
}) => {
  return (
    <PopoverContext.Provider value={{ open, onOpenChange }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    children: React.ReactNode
  }
>(({ asChild = false, children, onClick, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(PopoverContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(!open)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: handleClick,
    } as any)
  }

  return (
    <button
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
  }
>(({ className, align = "center", children, ...props }, ref) => {
  const { open } = React.useContext(PopoverContext)
  
  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        {
          "left-0": align === "start",
          "left-1/2 -translate-x-1/2": align === "center", 
          "right-0": align === "end",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
