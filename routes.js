import React                 from "react";
// noinspection NpmUsedModulesInstalled
import { IndexRoute, Route } from "react-router";

import App                  from "./components/app";
import FullPageLayout       from "./components/layouts/full_page_layout";
import SideNavLayout        from "./components/layouts/side_nav_layout";
import PageBrands           from "./components/pages/brand/page_brands";
import PageCategory         from "./components/pages/brand/page_category";
import PageIntrinsicReviews from "./components/pages/brand/page_intrinsic_reviews";
import PageProductReviews   from "./components/pages/brand/page_product_reviews";
import PageProducts         from "./components/pages/brand/page_products";
import Settings             from "./components/pages/brand/page_settings";
import PageVisualize        from "./components/pages/brand/page_visualize";
import PageTrends           from "./components/pages/brand/page_trends";
import PageRadar            from "./components/pages/brand/page_radar";
import PageEvents           from "./components/pages/events/page_events";
import LoginForm            from "./components/pages/login/login";
import ChangePasswordForm   from "./components/pages/password/ChangePasswordForm";
import LostPasswordForm     from "./components/pages/password/LostPasswordForm";

// import PageHome from './components/pages/home/page_home';

export default (
	<Route path="/" component={ App }>
		<IndexRoute component={ LoginForm }/>
		<Route path="/category" component={ SideNavLayout }>
			<IndexRoute component={ PageBrands }/>
			<Route path="/category/:category" component={ PageCategory }/>
		</Route>
		<Route path="/brands" component={ SideNavLayout }>
			<IndexRoute component={ PageBrands }/>
			<Route path="/brands/:name" component={ PageBrands }/>
		</Route>
		<Route path="/events" component={ FullPageLayout }>
			<IndexRoute component={ PageEvents }/>
			<Route path="/events/:category" component={ PageEvents }/>
		</Route>
		<Route path="/products/sources/:productId" component={ FullPageLayout }>
			<IndexRoute component={ PageProductReviews }/>
			<Route path="/products/sources/:productId" component={ FullPageLayout }/>
		</Route>
		<Route path="/products" component={ SideNavLayout }>
			<IndexRoute component={ PageProducts }/>
			<Route path="/products/:category" component={ PageProducts }/>
			<Route path="/products/:category/:brand" component={ PageProducts }/>
		</Route>
		<Route path="/sources/exemplars" component={ SideNavLayout }>
			<IndexRoute component={ PageIntrinsicReviews }/>
			<Route path="/sources/exemplars/:category/:intrinsic" component={ PageIntrinsicReviews }/>
		</Route>
		<Route path="/intrinsics_reports" component={ SideNavLayout }>
			<IndexRoute component={ PageVisualize }/>
			<Route path="/intrinsics_reports/:category" component={ PageVisualize } global_intrinsics={false} intrinsic_type={"intrinsics_reports"}/>
		</Route>
        <Route path="/global_intrinsics_reports" component={ SideNavLayout }>
            <IndexRoute component={ PageVisualize }/>
            <Route path="/global_intrinsics_reports/:category" component={ PageVisualize } global_intrinsics={true} intrinsic_type={"global_intrinsics_reports"}/>
        </Route>

		<Route path="/trends" component={ SideNavLayout }>
			<IndexRoute component={ PageTrends }/>
			<Route path="/trends/:category" component={ PageTrends }/>
		</Route>
		<Route path="/trends" component={ SideNavLayout }>
			<IndexRoute component={ PageRadar }/>
			<Route path="/radar/:category" component={ PageRadar }/>
		</Route>
		<Route path="/settings" component={ FullPageLayout }>
			<IndexRoute component={ Settings }/>
			<Route path="/settings" component={ Settings }/>
		</Route>
		<Route path="/lostpassword" component={ App }>
			<IndexRoute component={ LostPasswordForm }/>
			<Route path="/lostpassword" component={ LostPasswordForm }/>
		</Route>
		<Route path="/changepassword" component={ App }>
			<IndexRoute component={ ChangePasswordForm }/>
			<Route path="/changepassword" component={ ChangePasswordForm }/>
		</Route>
	</Route>
);
