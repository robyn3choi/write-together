import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@mantine/core'
const RichTextEditor = dynamic(() => import('@mantine/rte'), { ssr: false })

export default function NewStory() {
  const [value, onChange] = useState('It was a dark and stormy night...')

  return (
    <div>
      <RichTextEditor
        value={value}
        onChange={onChange}
        styles={{
          root: { fontFamily: 'serif' },
        }}
        controls={[
          ['bold', 'italic', 'underline', 'strike', 'clean'],
          ['h1', 'h2', 'h3', 'h4'],
          ['unorderedList', 'orderedList'],
          ['alignLeft', 'alignCenter', 'alignRight'],
          ['sup', 'sub'],
        ]}
      />
      <Button>Create</Button>
    </div>
  )
}
