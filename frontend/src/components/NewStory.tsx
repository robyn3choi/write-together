import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@mantine/core'
import FontPicker from './FontPicker'
const RichTextEditor = dynamic(() => import('@mantine/rte'), { ssr: false })

export default function NewStory() {
  const [value, onChange] = useState('It was a dark and stormy night...')
  const [font, setFont] = useState('Georgia')

  return (
    <div>
      <FontPicker value={font} onChange={(val) => setFont(val)} />
      <RichTextEditor
        value={value}
        onChange={onChange}
        styles={{
          root: { fontFamily: font },
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
