import { useState, forwardRef } from 'react'
import { Select, Text } from '@mantine/core'

const fonts = [
  'American Typewriter',
  'Andalé Mono',
  'Arial',
  'Arial Black',
  'Bradley Hand',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier',
  'Didot',
  'Georgia',
  'Impact',
  'Lucida Console',
  'Luminari',
  'Monaco',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
]

const data = fonts.map((font) => ({ label: font, value: font }))

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function FontPicker({ value, onChange }: Props) {
  return (
    <Select
      label="Font family"
      value={value}
      itemComponent={SelectItem}
      data={data}
      onChange={(val) => onChange(val)}
      styles={{ input: { fontFamily: value || 'inherit' } }}
    />
  )
}

// below code is for custom select item

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ label, ...others }: ItemProps, ref) => (
  <div ref={ref} {...others}>
    <Text style={{ fontFamily: label }}>{label}</Text>
  </div>
))
