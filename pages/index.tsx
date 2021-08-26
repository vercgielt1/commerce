
import { CarouselCommon, LabelCommon, Layout, QuanittyInput,CheckboxCommon ,Author,DateTime} from 'src/components/common'
import imgAuthor from '../src/components/common/Author/img/author.png';
const dataTest = [{
  text: 1
}, {
  text: 2
}, {
  text: 3
}, {
  text: 4
}, {
  text: 5
}, {
  text: 6
}]
const test = (props: { text: string }) => <div className="h-64 bg-yellow-300">{props.text}</div>
export default function Home() {
  return (
    <>
      <CheckboxCommon defaultChecked={true}></CheckboxCommon>
      <Author image={imgAuthor} name="Alessandro Del Piero"></Author>
      <DateTime date="april 30,2021"></DateTime>
    </>
  )
}

Home.Layout = Layout
