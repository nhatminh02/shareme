import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import { client } from "../client";
import { ChangedContext } from "../contexts/ChangedContext";
import { feedQuery, searchQuery } from "../utils/data";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";

const Feed = () => {
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState(null);
  const { categoryId } = useParams();
  const {
    changed: { transition },
    setChanged,
  } = useContext(ChangedContext);

  useEffect(() => {
    client.fetch(feedQuery).then((data) => {
      setPins(data);
    });

    setChanged("");
  }, [transition]);

  useEffect(() => {
    setLoading(true);

    if (categoryId) {
      const query = searchQuery(categoryId);

      client.fetch(query).then((data) => {
        setPins(data);
        setLoading(false);
      });
    } else {
      client.fetch(feedQuery).then((data) => {
        setPins(data);
        setLoading(false);
      });
    }
  }, [categoryId]);

  if (loading)
    return <Spinner message="We are adding new ideas to your feed!" />;

  return <div>{pins && <MasonryLayout pins={pins} />}</div>;
};

export default Feed;
