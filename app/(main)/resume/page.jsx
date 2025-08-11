import { getResume } from '@/actions/resume'
import ResumeBuilder from './_components/resume-builder'
import React from 'react'

const ResumePage = async() => {
    
    const resume = await getResume()

  return (
    <div className='container mx-auto py-6'>
      <ResumeBuilder initalContent = {resume?.content}/>
    </div>
  )
}

export default ResumePage
