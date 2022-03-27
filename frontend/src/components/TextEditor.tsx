import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@mantine/rte'), { ssr: false })

type Props = {
  value: string
  onChange: (val: string) => void
  font?: string
}

export default function TextEditor({ value, onChange, font = 'Georgia' }: Props) {
  console.log(value)
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      styles={{
        root: { fontFamily: font, minHeight: '300px' },
      }}
      controls={[
        ['bold', 'italic', 'underline', 'strike', 'clean'],
        ['h1', 'h2', 'h3', 'h4'],
        ['unorderedList', 'orderedList'],
        ['alignLeft', 'alignCenter', 'alignRight'],
        ['sup', 'sub'],
      ]}
    />
  )
}
