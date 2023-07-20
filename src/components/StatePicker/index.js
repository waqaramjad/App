import React, {useMemo, useState, useRef} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import useLocalize from '../../hooks/useLocalize';
import FormHelpMessage from '../FormHelpMessage';
import StateSelectorModal from './StateSelectorModal';

const propTypes = {
    /** Error text to display */
    errorText: PropTypes.string,

    /** State to display */
    // Adding a default value overrides the value coming from the Form
    // eslint-disable-next-line react/require-default-props
    value: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** A ref to forward to MenuItemWithTopDescription */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
};

const defaultProps = {
    forwardedRef: undefined,
    errorText: '',
    onInputChange: () => {},
};

function StatePicker({value, errorText, onInputChange, forwardedRef}) {
    const {translate} = useLocalize();
    const allStates = useRef(translate('allStates')).current;
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState(lodashGet(allStates, `${value}.stateName`, ''));

    const title = useMemo(() => {
        if (allStates[value]) {
            return allStates[value].stateName;
        }

        return '';
    }, [value, allStates]);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateStateInput = (state) => {
        onInputChange(state.value);
        setSearchValue(lodashGet(allStates, `${state.value}.stateName`, ''));
        hidePickerModal();
    };

    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={title}
                description={translate('common.state')}
                descriptionTextStyle={descStyle}
                onPress={showPickerModal}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <StateSelectorModal
                isVisible={isPickerVisible}
                currentState={value}
                onClose={hidePickerModal}
                onStateSelected={updateStateInput}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
            />
        </View>
    );
}

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default React.forwardRef((props, ref) => (
    <StatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
