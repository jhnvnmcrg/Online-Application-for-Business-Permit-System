import Header from '../includes/Header';
import { useState } from 'react';

function Tracking() {

    const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-color-tertiary'>
        <Header/>
        <div className='container vw-75 mt-5 container-sise'>
            <div className='row mt-3'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='text-center align-middle my-5'>
                                <h1 className='display-4 mb-0 mt-4'>Business Permit Tracking</h1>
                                <p className='lead'>Easily track the status of your business permit application by searching with your name or Business ID. Stay updated on the progress of your application!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='text-center align-middle my-1'>
                                <div className='row'>
                                    <div className='col-9'>
                                        <input type='text' className='form-control form-control-lg' placeholder='Enter Business Name or ID' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress}/>
                                    </div>
                                    <div className='col-3'>
                                        <button className='btn btn-primary btn-lg w-100' onClick={handleSearch}> Search </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='text-center align-middle my-2'>
                                <h5> Search Business Permit </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Tracking