const employment = object({
  jobTitle: text(),
  company: text(),
  city: text(),
  startDate: date(),
  endDate: date(),
})

const skill = object({
  name: text(),
  skills: tags(),
})

const resumeEditor = editor({
    input: object({
        name: text(),
        image: image(),
        location: text(),
        email: text(),
        phone: text(),
        summary: section({
            title: text(),
            content: richTextContent(),
        }),
        employments: section({
          title: text(),
          employments: list(employment())
        }),
        education: section({
          title: text(),
          content: list(employment()),
        }),
        skills: section({
          title: text(),
          content: list(skill()),
        }),
    }),
})

type Resume = Static<typeof resumeEditor.input>
const Editor = createEditor<Resume>(resumeEditor)

const ResumeEditor = () => {
    const [value, setValue] = useState<Resume>({
      name: 'John Doe',
      image: {
        src: 'https://example.com/image.jpg',
        alt: 'John Doe',
      },
      location: 'New York, NY',
      email: ''
    })

    const handleUpdate = (data) => {

    }

    return <Editor value={value} onUpdate={handleUpdate} />
}