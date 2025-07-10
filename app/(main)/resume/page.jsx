import { getResume } from '@/actions/resume'
import React from 'react'

const ResumePage = async() => {
    
    const resume = await getResume()

  return (
    <div>
      <ResumeBuilder initalContent = {resume.content}/>
    </div>
  )
}

export default ResumePage
