import "./CustomTooltip.scss";

const CustomTooltip = ({
  active,
  payload,
}: {
  active: boolean;
  payload: any[];
}) => {
  if (active) {
    return (
      <div className="scatter__tooltip">
        <p className="label">{`${payload[2]?.value}`}</p>
        <p className="label">{`${payload[0]?.name} : ${payload[0]?.value}%`}</p>
        <p className="label">{`${payload[1]?.name} : ${payload[1]?.value}%`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
