import Header from '../includes/Header';
import { useState } from 'react';

function ContactUs() {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-color-tertiary'>
        <Header/>
        <div className='container vw-75 mt-5 container-sise'>
            <div className='row mt-3'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='text-center align-middle my-5'>
                                <h1 className='display-4 mb-0 mt-4'>Contact Us</h1>
                                <p className='lead'>To seek assistance for issues and concerns, or request information about the procedures, you may reach the City Government hotlines or send request through the details below.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ContactUs