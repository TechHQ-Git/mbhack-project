import React, { Component } from 'react';
import request from 'request';
import url from 'url';
import truffleContract from 'truffle-contract';
import getWeb3 from '../../utils/getWeb3';
import EscrowContract from '../../contracts/Escrow.json';
import EuroCoinContract from '../../contracts/EuroCoin.json';

import '../Main.module.css';
import './Proposals.module.css';

import usersImg from '../../assets/users.svg';
import transmissionImg from '../../assets/transmission.svg';
import suitcaseImg from '../../assets/suitcase.svg';
import temperatureImg from '../../assets/ice-crystal.svg';
import carDoorImg from '../../assets/car-door.svg';
import energyImg from '../../assets/bold.svg';


// eslint-disable-next-line react/no-multi-comp
class Proposals extends Component {
    constructor() {
        super();
        this.state = {
            web3: null,
            accounts: null,
            escrowContract: null,
            euroCoinContract: null,
            carsResult: [],
            isHidden: false,
            showButtons: false,
            done: false,
        };
    }

    async componentDidMount() {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const Contract = truffleContract(EscrowContract);
            Contract.setProvider(web3.currentProvider);
            const escrowContract = await Contract.deployed();
            // Get the contract instance.
            const ContractCoin = truffleContract(EuroCoinContract);
            ContractCoin.setProvider(web3.currentProvider);
            const euroCoinContract = await ContractCoin.deployed();

            console.log('window.ethereum', window.ethereum);

            // window.ethereum.enable();

            const { done } = this.state;
            if (window.location.href.indexOf('proposals?to=') > -1 && done === false) {
                // eslint-disable-next-line no-undef
                const parts = url.parse(window.location.href, true);
                const { to, price } = parts.query;


                await escrowContract.escrow(to, price, { from: accounts[0] });
                const paymentFilter = web3.eth.filter('latest');
                paymentFilter.watch((error, log) => {
                    if (error) {
                        console.log('An error ocurred!');
                    } else {
                        console.log('In Escrow!');
                    }
                    console.log(log);
                    paymentFilter.stopWatching();
                });
            } else if (window.location.href.indexOf('proposals?finishto=') > -1 && done === false) {
                // eslint-disable-next-line no-undef
                const parts = url.parse(window.location.href, true);
                const { finishto, price } = parts.query;


                await escrowContract.finish(finishto, price, { from: accounts[0] });
                const paymentFilter = web3.eth.filter('latest');
                paymentFilter.watch((error, log) => {
                    if (error) {
                        console.log('An error ocurred!');
                    } else {
                        console.log('In Escrow!');
                    }
                    console.log(log);
                    paymentFilter.stopWatching();
                });
            }
        } catch (error) {
            console.log('Failed to load web3, accounts, or contract. Check console for details.');
            console.log(error);
        }

        // eslint-disable-next-line no-undef
        const parts = url.parse(window.location.href, true);
        const { type, make, model } = parts.query;

        request.post({
            url: 'http://localhost:3001/search-vehicles',
            form: {
                type, make, model,
            },
        }, (err, httpResponse, body) => {
            if (httpResponse.statusCode === 200) {
                const jsonObject = JSON.parse(body);
                const elements = jsonObject.length;
                const carsResult = [];
                for (let e = 0; e < elements; e += 1) {
                    carsResult.push(jsonObject[e]);
                }
                console.log(carsResult);
                this.setState({ carsResult });
            }
        });
    }


    toggleHidden() {
        const { isHidden } = this.state;
        this.setState({
            isHidden: !isHidden,
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async handleSubmit(event) {
        const priceToPay = 50000000000000;
        const dummyAccount = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';
        window.location = `proposals?to=${dummyAccount}&price=${priceToPay}`;
        console.log(event);
        event.preventDefault();
    }

    renderVehicle(data) {
        const services = data.services.map(service => (
            <div className="More__DetailsGrid">
                <div>
                    <p className="More__DetailsContent">{service.serviceType}</p>
                </div>
                <div>
                    <p className="More__DetailsContent">{service.serviceProvider}</p>
                </div>
                <div>
                    <p className="More__DetailsContent">{service.serviceFee}</p>
                </div>
                <div>
                    <p className="More__DetailsContent">{Math.floor(service.serviceFee)} Days ago</p>
                </div>
            </div>
        ));

        return (
            <div className="Proposal__Card">
                <p className="Proposal__Title">
                    {data.make}
                    {' '}
                    {data.model}
                </p>
                <div className="Proposal__Underline" />
                <form onSubmit={this.handleSubmit}>
                    <div className="Proposal__CardGrid">
                        <img className="Proposal__Image" alt="img" src={data.picture} />
                        <div>
                            <p className="Proposal__CardTitle">Mileage Unlimited</p>
                            <p className="Proposal__CardSubtitle">Minimum Age 18 years</p>
                            <div className="Proposal__CardInnerGrid">
                                <div>
                                    <img className="Proposal__Icons" src={usersImg} alt="users" />
                                    <p className="Proposal__IconsValue">{data.doors}</p>
                                </div>
                                <div>
                                    <img className="Proposal__Icons" src={transmissionImg} alt="transmission" />
                                    <p className="Proposal__IconsValue">{data.driving}</p>
                                </div>
                                <div>
                                    <img className="Proposal__Icons" src={suitcaseImg} alt="suitcase" />
                                    <p className="Proposal__IconsValue">2</p>
                                </div>
                                <div>
                                    <img className="Proposal__Icons" src={temperatureImg} alt="temperature" />
                                    <p className="Proposal__IconsValue">Yes</p>
                                </div>
                                <div>
                                    <img className="Proposal__Icons" src={carDoorImg} alt="car door" />
                                    <p className="Proposal__IconsValue">{data.doors}</p>
                                </div>
                                <div>
                                    <img className="Proposal__Icons" src={energyImg} alt="car door" />
                                    <p className="Proposal__IconsValue">{data.co2}</p>
                                </div>
                            </div>

                            <p className="Proposal__MoreDetails" onClick={() => this.toggleHidden()}>More Details ></p>
                        </div>
                        {this.state.showButtons === true ? (
                            <div>
                                <button className="Button Proposal__Button_Finish" onClick={() => this.finishButton()}>FINISH</button>
                                <button className="Button Proposal__Button_Support">CONTACT SUPPORT</button>
                            </div>
                        ) : null}
                    </div>
                    <input className="Button button__Proposals" value="BOOK" type="submit" />
                </form>


                {this.state.isHidden === true ? (
                    // {/* More Details section */}
                    <div className="More__Details">
                        <div className="More__DetailsGrid">
                            <p className="More__DetailsTitle inline">Service</p>
                            <p className="More__DetailsTitle inline">Provider</p>
                            <p className="More__DetailsTitle inline">Cost</p>
                            <p className="More__DetailsTitle inline">Date</p>
                        </div>

                        <div>{services}</div>
                        <div className="Proposal__CardPriceTotal">
                            <span className="Proposal__CardPriceTotal_Margin">Total: </span>
                            {data.price}
                        </div>

                    </div>

                ) : null}
            </div>);
    }

    render() {
        const {
            carsResult,
        } = this.state;
        let resultsToShow;
        if (carsResult.length > 0) {
            resultsToShow = this.renderVehicle(carsResult[0]);
        }
        return (
            <div className="Search__Container Proposal__Container">
                <h1 className="Search__Title Search__Title_Padding">Proposals</h1>
                {resultsToShow}
            </div>
        );
    }
}

export default Proposals;
