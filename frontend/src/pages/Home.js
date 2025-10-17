import Header from "../includes/Header";
import permiticon from "../assets/images/newicon_new.png";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-color-tertiary">
      <Header />
      <div className="container vw-75 my-5">
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="text-center align-middle my-4">
                  <h1 className="display-4 mb-0">Online</h1>
                  <h1 className="display-4">Application for Business Permit</h1>
                  <div className="site-description">
                    Start Strong, Stay Legit — Get Your Business Permit Now!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-3 mt-5 text-center align-middle">
                    <img
                      className="img img-fluid"
                      src={permiticon}
                      alt="New Business icon"
                    />
                  </div>
                  <div className="col-9">
                    <div className="row">
                      <div className="col-12">
                        <hr />
                        <h3 className="text-left text-monospace">
                          NEW Business Permit
                        </h3>
                        <hr />
                        <h6 className="text-muted">
                          Get a Mayor's Permit for your new business through
                          online with these easy steps:
                        </h6>
                        <ul className="main-list">
                          <li>
                            Fill out online application form and attach required
                            documents
                          </li>
                          <li>
                            Wait for a call from the Business Bureau for
                            confirmation and verification
                          </li>
                          <li>Monitor progress of your application</li>
                          <li>
                            Print Mayor's Permit here or through the link sent
                            in email
                          </li>
                        </ul>
                      </div>
                    </div>
                    <hr />
                    <div className="row text-center">
                      <div className="col-6 mt-2">
                        <Link
                          className="btn btn-outline-primary rounded-pill"
                          to="/oabps/user/login"
                        >
                          Apply for New Application
                        </Link>
                      </div>
                      <div className="col-6 mt-2">
                        <a
                          className="btn btn-outline-info rounded-pill"
                          href="/"
                        >
                          Check Application Status
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-9">
                    <div className="row">
                      <div className="col-12">
                        <hr />
                        <h3 className="text-left text-monospace">
                          REQUIREMENTS FOR BUSINESS REGISTRATION
                        </h3>
                        <hr />
                        <h6 className="text-muted">
                          NEW BUSINESS (Requirements to attach prior the
                          encoding Issuance of Business Permit)
                        </h6>
                        <ol className="main-list">
                          <li>
                            Copy of Barangay Clearance where such business is to
                            be established
                          </li>
                          <li>
                            Copy of Lease Contract/Similar legal Instrument (if
                            renting a building space or land)
                          </li>
                          <li>Copy of Occupancy Permit</li>
                          <li>
                            Copy of Certificate of Registration of Business Name
                            from DTI (Single/Sole Proprietorship)
                          </li>
                          <li>
                            Copy of Certificate of Registration from Regulating
                            Government Agency (including By-laws)
                            (Foundation/Association)
                          </li>
                          <li>
                            {" "}
                            Copy of Certificate of registration with Securities
                            and Exchange Commission (including Article of
                            Incorporation and By-Laws) (Corporation/Partnership)
                          </li>
                          <li>
                            Copy of Certificate of Registration with CDA
                            (including Article of Cooperation and By-Laws)
                            (Cooperatives)
                          </li>
                        </ol>
                      </div>
                    </div>
                    <hr />
                  </div>
                  <div className="col-3 mt-5 text-center align-middle">
                    <img
                      className="img img-fluid"
                      src={permiticon}
                      alt="New Business icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-3 mt-5 text-center align-middle">
                    <img
                      className="img img-fluid"
                      src={permiticon}
                      alt="New Business icon"
                    />
                  </div>
                  <div className="col-9">
                    <div className="row">
                      <div className="col-12">
                        <hr />
                        <h3 className="text-left text-monospace">
                          RENEWAL of Business Permit
                        </h3>
                        <hr />
                        <h6 className="text-muted">
                          Renew your business permit easily by following this
                          procedure:
                        </h6>
                        <ul className="main-list">
                          <li>
                            Register your email address to get access code
                          </li>
                          <li>
                            Review your information and attach required
                            documents
                          </li>
                          <li>Monitor progress of your application</li>
                          <li>
                            Print Mayor’s Permit here or through the link sent
                            in email
                          </li>
                        </ul>
                        <h6 className="text-muted">Required Documents</h6>
                        <ol className="main-list">
                          <li>
                            Basis for computing taxes, fees, end
                            charges/Application for Business Permit with
                            declared gross sales/receipt
                          </li>
                          <li>
                            Copy of Barangay Clearance where the business is
                            Located.
                          </li>
                          <li>
                            Clearance or Compliance Certificate/Permit/similar
                            documents from government offices/agencies that
                            submit Negative Lists to the City Government This
                            additional requirement will be submitted/attached by
                            the applicant during renewal of Business/Mayors
                            Permit.
                          </li>
                        </ol>
                      </div>
                    </div>
                    <hr />
                    <div className="row text-center">
                      <span className="text-monospace text-danger">
                        PAGE CURRENTLY UNDER DEVELOPMENT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="text-center align-middle my-4">
                  <h1 className="display-4 mb-0 mt-4">Contact Us</h1>
                  <p className="lead">
                    Connect with the City Government Offices for issues and
                    inquiries
                  </p>
                  <hr className="my-4" />
                  <p>
                    Questions not answered? Experiencing technical issues? Get
                    in touch with a representative. We'll be in contact as soon
                    as possible.
                  </p>
                  <Link
                    to="/contactus"
                    className="mt-2 btn rounded-pill btn-outline-info btn-lg"
                  >
                    Contact Us »
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
