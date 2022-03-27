import { useState } from 'react'
//import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { ActionIcon, UnstyledButton } from '@mantine/core'

export default function Carousel({ items, onChange }) {
  const [index, setIndex] = useState(0)

  function handlePrevious() {
    const newIndex = index - 1
    setIndex(newIndex)
    onChange(newIndex)
  }

  function handleNext() {
    const newIndex = index + 1
    setIndex(newIndex)
    onChange(newIndex)
  }

  return (
    <div className="relative">
      {items[index]}
      {index > 0 && (
        <ActionIcon
          className="absolute -left-12 top-1/2 w-12 h-12 text-gray-500 hover:text-gray-800 hover:bg-transparent"
          style={{ transform: 'translateY(-50%)' }}
          onClick={handlePrevious}
        >
          <ChevronLeftIcon />
        </ActionIcon>
      )}
      {index < items.length - 1 && (
        <ActionIcon
          className="absolute ml-2 -right-12 top-1/2 w-12 h-12 text-gray-500 hover:text-gray-800 hover:bg-transparent"
          style={{ transform: 'translateY(-50%)' }}
          onClick={handleNext}
        >
          <ChevronRightIcon />
        </ActionIcon>
      )}
    </div>
  )
}
