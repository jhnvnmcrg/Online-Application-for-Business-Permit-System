import Header from '../includes/Header';
import { useState } from 'react';

function About() {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-color-tertiary'>
        <Header/>
        <div className='container vw-75 mt-5 container-sise'>
            <div className='row mt-3'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='text-center align-middle my-5'>
                                <h1 className='display-4 mb-0 mt-4'>About</h1>
                                <p className='lead mt-4'>Developed by John Ivan Macaraeg & Fre Ann Jaleco Arroyo</p>
                                <span className='site-description'>hehe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default About