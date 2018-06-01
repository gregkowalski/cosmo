import React from 'react'
import InfoPage from './InfoPage'
import { Image } from 'semantic-ui-react'
import './About.css'
import aboutImg from './about-img.jpg'

const About = () => {
    const header = (
        <div className='about-header'>
            <Image src={aboutImg} />
            {/* <div>Photograph by Brooke Lark</div> */}
            <div className='about-title'>What is Foodcraft?</div>            
        </div>
    );
    return (
        <InfoPage header={header}>
            <div className='about-content'>
            <p>Foodcraft is a marketplace for unique handmade foods.</p>
            <p>By connecting our local communities, Foodcraft creates a space to support 
                cooks as they grow their own business. </p>
                
              <p>  We believe in a community built by neighbours and the irresistable power of quality, small-batch foods.</p>
            </div>
        </InfoPage>
    )
}

export default About;