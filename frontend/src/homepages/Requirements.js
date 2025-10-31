import Header from '../includes/Header';
import reqmage from '../assets/images/reqmage.png'
import '../style.css'

function Requirements() {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-color-tertiary vh-100 vw-100'>
        <Header/>
        <h3 className='site-title-link'>REQUIREMENTS</h3>
        <div className='scrollmenu'>
            <div className='menuscroll'>
                <div className='card text-center pt-5 pb-3 mb-3 card-size'>
                    <img src={reqmage} className="card-img-top rounded mx-auto d-block w-50" alt=""></img>
                    <div className='card-body'>
                        <h5 className='card-title'>Title</h5>
                        <p className='card-text'>description</p>
                        <a href='#' className='btn btn-primary'>Request</a>
                    </div>
                </div>
            </div>
            <div className='menuscroll'>
                <div className='card text-center pt-5 pb-3 mb-3 card-size'>
                    <img src={reqmage} className="card-img-top rounded mx-auto d-block w-50" alt=""></img>
                    <div className='card-body'>
                        <h5 className='card-title'>Title</h5>
                        <p className='card-text'>description</p>
                        <a href='#' className='btn btn-primary'>Request</a>
                    </div>
                </div>
            </div>
            <div className='menuscroll'>
                <div className='card text-center pt-5 pb-3 mb-3 card-size'>
                    <img src={reqmage} className="card-img-top rounded mx-auto d-block w-50" alt=""></img>
                    <div className='card-body'>
                        <h5 className='card-title'>Title</h5>
                        <p className='card-text'>description</p>
                        <a href='#' className='btn btn-primary'>Request</a>
                    </div>
                </div>
            </div>
            <div className='menuscroll'>
                <div className='card text-center pt-5 pb-3 mb-3 card-size'>
                    <img src={reqmage} className="card-img-top rounded mx-auto d-block w-50" alt=""></img>
                    <div className='card-body'>
                        <h5 className='card-title'>Title</h5>
                        <p className='card-text'>description</p>
                        <a href='#' className='btn btn-primary'>Request</a>
                    </div>
                </div>
            </div>
            <div className='menuscroll'>
                <div className='card text-center pt-5 pb-3 mb-3 card-size'>
                    <img src={reqmage} className="card-img-top rounded mx-auto d-block w-50" alt=""></img>
                    <div className='card-body'>
                        <h5 className='card-title'>Title</h5>
                        <p className='card-text'>description</p>
                        <a href='#' className='btn btn-primary'>Request</a>
                    </div>
                </div>
            </div>
            <div className='menuscroll'>
                <div className='card text-center pt-5 pb-3 mb-3 card-size'>
                    <img src={reqmage} className="card-img-top rounded mx-auto d-block w-50" alt=""></img>
                    <div className='card-body'>
                        <h5 className='card-title'>Title</h5>
                        <p className='card-text'>description</p>
                        <a href='#' className='btn btn-primary'>Request</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Requirements;