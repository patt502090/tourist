import { TabPanelProps } from '../../utils/types';

export default function CustomTabPanel(props: TabPanelProps) {
  const { children, value, innerDivClassName, wrapperClassName, index, ...other } = props;

  return (
    <div
      className={wrapperClassName ?? ''}
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className={innerDivClassName ?? ''}>{children}</div>}
    </div>
  );
}
