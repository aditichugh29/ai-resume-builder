import React from 'react'
import { Banner } from '../components/home/Banner'
import { Hero } from '../components/home/Hero'
import { Feature } from '../components/home/Feature'
import { Title } from '../components/home/Title'
import Testimonial from '../components/home/Testimonial'
import CallToAction from '../components/home/CallToAction'
import Footer from '../components/home/Footer'
const Home = () => {
  return (
    <div>
        <h1>
         <Banner />
         <Hero />
         <Feature />
          <Title />
         <Testimonial />
         <CallToAction />
         <Footer />
        </h1>
    </div>
  )
}

export default Home