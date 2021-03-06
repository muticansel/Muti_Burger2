import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from '../../axios-orders';

import Aux from '../../hoc/Auxx/Auxx';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../store/actions/index';

class BurgerBuilder extends Component {
	// constructor(props) {
	//     super(props);

	// }

	state = {
		purchasing: false
	}

	componentDidMount() {
		this.props.onInitIngredients()
	}

	updatePurchaseState(ingredients) {
		const sum = Object.keys(ingredients)
			.map(ingKey => {
				return ingredients[ingKey];
			})
			.reduce((sum, el) => {
				return sum + el;
			}, 0);
		return sum > 0;
	}

	purchaseHandler = () => {
		if(this.props.isAuth) {
			this.setState({
				purchasing: true
			});
		}
		else {
			this.props.onSetAuthRedirectPath('checkout');
			this.props.history.push('/auth');
		}
	}

	purchaseCancelHandler = () => {
		this.setState({
			purchasing: false
		});
	}

	purchaseContinueHandler = () => {
		this.props.onInitPurchase();
		this.props.history.push('/checkout');
	}

	render() {
		const disabledInfo = {
			...this.props.ings
		};
		for (let key in disabledInfo) {
			disabledInfo[key] = disabledInfo[key] <= 0
		}
		let orderSummary = null;
		let burger = this.props.error ? <p>Ingredients can't be loaded</p> : <Spinner />

		if (this.props.ings) {
			burger = (
				<Aux>
					<Burger ingredients={this.props.ings} />
					<BuildControls
						disabled={disabledInfo}
						price={this.props.price}
						isAuth={this.props.isAuth}
						ordered={this.purchaseHandler}
						purchaseable={this.updatePurchaseState(this.props.ings)}
						ingredientAdded={this.props.onIngredientAdded}
						ingredientRemoved={this.props.onIngredientRemoved} />
				</Aux>
			);


			orderSummary = <OrderSummary
				price={this.props.price.toFixed(2)}
				purchaseCancelled={this.purchaseCancelHandler}
				purchaseContinued={this.purchaseContinueHandler}
				ingredients={this.props.ings} />
		}

		return (
			<Aux>
				<Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
					{orderSummary}
				</Modal>
				{burger}
			</Aux>
		);
	}
}

const mapStateToProps = state => {
	return {
		ings: state.burgerBuilder.ingredients,
		price: state.burgerBuilder.totalPrice,
		error: state.burgerBuilder.error,
		isAuth: state.auth.token !== null
	};
}

const mapDispatchToProps = dispatch => {
	return {
		onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
		onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
		onInitIngredients: () => dispatch(actions.initIngredient()),
		onInitPurchase: () => dispatch(actions.purchaseInit()),
		onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));