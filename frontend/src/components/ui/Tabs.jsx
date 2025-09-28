// src/components/ui/tabs.jsx
import * as React from "react"

const TabsContext = React.createContext()

export function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)

  const isActive = activeTab === value

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all 
        ${isActive ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}
        ${className}`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  const { activeTab } = React.useContext(TabsContext)

  if (activeTab !== value) return null

  return <div className={`mt-2 ${className}`}>{children}</div>
}
