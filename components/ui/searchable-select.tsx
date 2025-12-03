import Select, { StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  className?: string
  isDisabled?: boolean
  isClearable?: boolean
  isCreatable?: boolean
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  id,
  className,
  isDisabled = false,
  isClearable = true,
  isCreatable = true
}) => {
  const selectOptions: Option[] = options.map(option => ({
    value: option,
    label: option
  }))

  const selectedOption = selectOptions.find(opt => opt.value === value) || (value ? { value, label: value } : null)

  const customStyles: StylesConfig<Option, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
      borderRadius: '0.375rem',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      },
      backgroundColor: '#f8fafc',
      cursor: 'pointer'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
        ? '#e0f2fe' 
        : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#3b82f6'
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '0.375rem'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1e293b'
    }),
    input: (provided) => ({
      ...provided,
      color: '#1e293b'
    })
  }

  const commonProps = {
    id,
    options: selectOptions,
    value: selectedOption,
    onChange: (option: Option | null) => onChange(option?.value || ''),
    placeholder,
    className,
    styles: customStyles,
    isDisabled,
    isClearable,
    isSearchable: true,
    noOptionsMessage: () => "Nenhuma opção encontrada",
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: "fixed" as const
  }

  if (isCreatable) {
    return (
      <CreatableSelect
        {...commonProps}
        formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
        onCreateOption={(inputValue) => {
          onChange(inputValue)
        }}
      />
    )
  }

  return <Select {...commonProps} />
}
